using BlogApi.Dtos;

namespace BlogApi.Cache;

public interface IFeaturedPostsCache
{
    Task<IReadOnlyList<BlogResponse>?> GetAsync(CancellationToken cancellationToken = default);

    Task SetAsync(IReadOnlyList<BlogResponse> posts, CancellationToken cancellationToken = default);
}

