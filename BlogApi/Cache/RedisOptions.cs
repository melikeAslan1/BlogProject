namespace BlogApi.Cache;

public class RedisOptions
{
    public const string SectionName = "Redis";

    public string ConnectionString { get; set; } = "localhost:6379";

    /// <summary>Öne çıkan yazılar için cache süresi (saniye).</summary>
    public int FeaturedTtlSeconds { get; set; } = 60;
}

