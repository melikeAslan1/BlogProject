namespace BlogApi.Search;

public interface IBlogSearchService
{
    bool IsEnabled { get; }

    Task EnsureIndexAsync(CancellationToken cancellationToken = default);

    Task IndexPostAsync(BlogPostSearchDocument document, CancellationToken cancellationToken = default);

    Task DeletePostAsync(int postId, CancellationToken cancellationToken = default);

    /// <summary>Elasticsearch kullanılamazsa null döner; çağıran PostgreSQL ile aramaya düşer.</summary>
    Task<BlogSearchHits?> SearchAsync(
        string queryText,
        string? authorId,
        bool isPublishedFilter,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}
