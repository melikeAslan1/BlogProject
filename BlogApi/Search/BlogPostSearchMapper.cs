using BlogApi.Models;

namespace BlogApi.Search;

public static class BlogPostSearchMapper
{
    public static BlogPostSearchDocument FromEntity(BlogPost b) => new()
    {
        Id = b.Id,
        Title = b.Title,
        Content = b.Content,
        Slug = b.Slug,
        AuthorId = b.AuthorId,
        AuthorFullName = b.Author?.FullName,
        IsPublished = b.IsPublished,
        CreatedAt = b.CreatedAt
    };
}
