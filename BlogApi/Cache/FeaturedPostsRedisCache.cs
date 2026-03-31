using System.Text.Json;
using BlogApi.Dtos;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace BlogApi.Cache;

public class FeaturedPostsRedisCache : IFeaturedPostsCache
{
    private const string Key = "featured:posts:page1:3";

    private readonly IDatabase _db;
    private readonly RedisOptions _options;
    private readonly ILogger<FeaturedPostsRedisCache> _logger;

    public FeaturedPostsRedisCache(IConnectionMultiplexer mux, IOptions<RedisOptions> options, ILogger<FeaturedPostsRedisCache> logger)
    {
        _db = mux.GetDatabase();
        _options = options.Value;
        _logger = logger;
    }

    public async Task<IReadOnlyList<BlogResponse>?> GetAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var value = await _db.StringGetAsync(Key);
            if (!value.HasValue)
            {
                _logger.LogInformation("Featured cache MISS");
                return null;
            }
            var posts = JsonSerializer.Deserialize<List<BlogResponse>>(value!);
            _logger.LogInformation("Featured cache HIT ({Count} kayıt)", posts?.Count ?? 0);
            return posts ?? [];
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis'ten öne çıkan yazılar okunamadı.");
            return null;
        }
    }

    public async Task SetAsync(IReadOnlyList<BlogResponse> posts, CancellationToken cancellationToken = default)
    {
        try
        {
            var json = JsonSerializer.Serialize(posts);
            var ttl = TimeSpan.FromSeconds(Math.Max(5, _options.FeaturedTtlSeconds));
            await _db.StringSetAsync(Key, json, ttl);
            _logger.LogInformation("Featured cache SET ({Count} kayıt, {Ttl}s)", posts.Count, (int)ttl.TotalSeconds);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis'e öne çıkan yazılar yazılamadı.");
        }
    }
}

