using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlogApi.Models;

public class BlogPost
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = default!;
    [Required, MaxLength(200)]
    public string Slug { get; set; } = default!;

    [Required]
    public string Content { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsPublished { get; set; } = true;

    [Required]
    public string AuthorId { get; set; } = default!;

    [ForeignKey(nameof(AuthorId))]
    public AppUser? Author { get; set; } 
}