using BlogApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BlogApi.Search;

/// <summary>Uygulama açılırken index yoksa oluşturur (Elasticsearch tek seferlik hazırlık).</summary>
public sealed class ElasticsearchIndexInitializer : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ElasticsearchIndexInitializer> _logger;

    public ElasticsearchIndexInitializer(
        IServiceScopeFactory scopeFactory,
        ILogger<ElasticsearchIndexInitializer> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var search = scope.ServiceProvider.GetRequiredService<IBlogSearchService>();
        var opts = scope.ServiceProvider.GetRequiredService<IOptions<ElasticsearchOptions>>().Value;
        if (!search.IsEnabled) return;

        try
        {
            await search.EnsureIndexAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Elasticsearch başlatılamadı; arama PostgreSQL yedek yoluna düşer. Docker / URI kontrol et.");
            return;
        }

        if (!opts.ReindexOnStartup) return;

        try
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var posts = await db.BlogPosts.AsNoTracking().Include(b => b.Author).ToListAsync(cancellationToken);
            foreach (var post in posts)
                await search.IndexPostAsync(BlogPostSearchMapper.FromEntity(post), cancellationToken);
            _logger.LogInformation("Elasticsearch {Count} yazı ile senkronlandı.", posts.Count);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Elasticsearch toplu indeksleme atlandı.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
