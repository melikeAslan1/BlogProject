namespace BlogApi.Search;

public class ElasticsearchOptions
{
    public const string SectionName = "Elasticsearch";

    /// <summary>Örn. http://localhost:9200 — boşsa arama PostgreSQL ile devam eder.</summary>
    public string? Uri { get; set; }

    /// <summary>Koleksiyon adı gibi: tüm blog dökümanları bu index altında.</summary>
    public string IndexName { get; set; } = "blog-posts";

    public bool Enabled { get; set; } = true;

    /// <summary>Geliştirmede true: uygulama açılınca PostgreSQL'deki tüm yazılar ES'e yazılır.</summary>
    public bool ReindexOnStartup { get; set; }
}
