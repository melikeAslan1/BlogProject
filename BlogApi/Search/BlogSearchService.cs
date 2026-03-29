using System.Globalization;
using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.Core.Search;
using Elastic.Clients.Elasticsearch.QueryDsl;
using Microsoft.Extensions.Options;

namespace BlogApi.Search;

public sealed class BlogSearchService : IBlogSearchService
{
    private readonly ILogger<BlogSearchService> _logger;
    private readonly ElasticsearchOptions _options;
    private readonly ElasticsearchClient? _client;

    public BlogSearchService(IOptions<ElasticsearchOptions> options, ILogger<BlogSearchService> logger)
    {
        _logger = logger;
        _options = options.Value;
        if (_options.Enabled && !string.IsNullOrWhiteSpace(_options.Uri))
        {
            var settings = new ElasticsearchClientSettings(new Uri(_options.Uri))
                .DefaultMappingFor<BlogPostSearchDocument>(m => m
                    .IdProperty(p => p.Id));
            _client = new ElasticsearchClient(settings);
        }
    }

    public bool IsEnabled => _client != null;

    private IndexName IndexName => _options.IndexName;

    public async Task EnsureIndexAsync(CancellationToken cancellationToken = default)
    {
        if (_client == null) return;

        var exists = await _client.Indices.ExistsAsync(IndexName, cancellationToken);
        if (exists.Exists) return;

        await _client.Indices.CreateAsync(IndexName, c => c
            .Mappings(m => m
                .Properties<BlogPostSearchDocument>(p => p
                    .IntegerNumber(n => n.Id)
                    .Text(t => t.Title)
                    .Text(t => t.Content)
                    .Keyword(k => k.Slug)
                    .Keyword(k => k.AuthorId)
                    .Text(t => t.AuthorFullName)
                    .Boolean(b => b.IsPublished)
                    .Date(d => d.CreatedAt))), cancellationToken);

        _logger.LogInformation("Elasticsearch index oluşturuldu: {Index}", IndexName);
    }

    public async Task IndexPostAsync(BlogPostSearchDocument document, CancellationToken cancellationToken = default)
    {
        if (_client == null) return;

        try
        {
            await _client.IndexAsync(document, i => i.Index(IndexName).Id(document.Id.ToString(CultureInfo.InvariantCulture)), cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Elasticsearch indexleme başarısız (post {PostId})", document.Id);
        }
    }

    public async Task DeletePostAsync(int postId, CancellationToken cancellationToken = default)
    {
        if (_client == null) return;

        try
        {
            var req = new DeleteRequest(IndexName, postId.ToString(CultureInfo.InvariantCulture));
            await _client.DeleteAsync(req, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Elasticsearch silme başarısız (post {PostId})", postId);
        }
    }

    public async Task<BlogSearchHits?> SearchAsync(
        string queryText,
        string? authorId,
        bool isPublishedFilter,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        if (_client == null) return null;

        var q = queryText.Trim();
        if (string.IsNullOrEmpty(q)) return null;

        try
        {
            var from = Math.Max(0, (page - 1) * pageSize);

            var response = await _client.SearchAsync<BlogPostSearchDocument>(s => s
                    .Indices(IndexName)
                    .From(from)
                    .Size(pageSize)
                    .TrackTotalHits(true)
                    .Query(query => query.Bool(b =>
                    {
                        b.Must(m => m.MultiMatch(mm => mm
                            .Query(q)
                            // JSON alan adları (varsayılan serializer camelCase)
                            .Fields(new[] { "title", "content" })));
                        b.Filter(f => f.Term(t => t.Field("isPublished").Value(isPublishedFilter)));
                        if (!string.IsNullOrWhiteSpace(authorId))
                            b.Filter(f => f.Term(t => t.Field("authorId").Value(authorId)));
                    })), cancellationToken);

            if (!response.IsValidResponse)
            {
                _logger.LogWarning("Elasticsearch arama geçersiz yanıt: {Debug}", response.DebugInformation);
                return null;
            }

            var ids = new List<int>();
            foreach (var hit in response.Hits)
            {
                if (hit.Source != null)
                    ids.Add(hit.Source.Id);
                else if (int.TryParse(hit.Id, CultureInfo.InvariantCulture, out var pid))
                    ids.Add(pid);
            }

            var total = response.HitsMetadata?.Total is { } u
                ? u.Match(static (TotalHits? th) => (long)(th?.Value ?? 0), static lon => lon)
                : ids.Count;

            return new BlogSearchHits(ids, total);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Elasticsearch arama hatası");
            return null;
        }
    }
}
