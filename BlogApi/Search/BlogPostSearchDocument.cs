namespace BlogApi.Search;

/// <summary>
/// Elasticsearch'e yazılan "döküman". PostgreSQL satırının aranabilir kopyasıdır.
/// </summary>
public class BlogPostSearchDocument
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string Slug { get; set; } = "";
    public string AuthorId { get; set; } = "";
    public string? AuthorFullName { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
}
