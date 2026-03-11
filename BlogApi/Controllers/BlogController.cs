using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlogApi.Data;
using BlogApi.Dtos;
using BlogApi.Models;
using BlogApi.Utils;

namespace YoboApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<AppUser> _userManager;

    public BlogController(AppDbContext context, UserManager<AppUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<BlogResponse>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? q = null,
        [FromQuery] string? authorId = null,
        [FromQuery] bool isPublished = true
    )
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var query = _context.BlogPosts.AsQueryable();
        if (isPublished)
            query = query.Where(b => b.IsPublished);
        if (!string.IsNullOrWhiteSpace(q))
        {
            var qLower = q.Trim().ToLower();
            query = query.Where(b =>
                EF.Functions.Like(b.Title.ToLower(), $"%{qLower}%") ||
                EF.Functions.Like(b.Content.ToLower(), $"%{qLower}%")
            );
        }
        if (!string.IsNullOrWhiteSpace(authorId))
            query = query.Where(b => b.AuthorId == authorId);
        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(b => b.Author)
            .ToListAsync();
        var result = items.Select(b => new BlogResponse
        {
            Id = b.Id,
            Title = b.Title,
            Slug = b.Slug,
            Content = b.Content,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            IsPublished = b.IsPublished,
            AuthorId = b.AuthorId,
            AutherFullName = b.Author?.FullName,
            AutherEmail = b.Author?.Email
        });
        return Ok(result);
    }
    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<ActionResult<BlogResponse>> GetById(int id)
    {
        var b = await _context.BlogPosts
            .Include(b => b.Author)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (b == null) return NotFound();

        if (!b.IsPublished)
        {
            var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (uid == null || uid != b.AuthorId)
                return Forbid();
        }

        return Ok(new BlogResponse
        {
            Id = b.Id,
            Title = b.Title,
            Slug = b.Slug,
            Content = b.Content,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            IsPublished = b.IsPublished,
            AuthorId = b.AuthorId,
            AutherFullName = b.Author?.FullName,
            AutherEmail = b.Author?.Email
        });
    }

    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<BlogResponse>> GetBySlug(string slug)
    {
        var b = await _context.BlogPosts
            .Include(b => b.Author)
            .FirstOrDefaultAsync(b => b.Slug == slug);
        if (b == null) return NotFound();

        if (!b.IsPublished)
        {
            var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (uid == null || uid != b.AuthorId)
                return Forbid();
        }

        return Ok(new BlogResponse
        {
            Id = b.Id,
            Title = b.Title,
            Slug = b.Slug,
            Content = b.Content,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            IsPublished = b.IsPublished,
            AuthorId = b.AuthorId,
            AutherFullName = b.Author?.FullName,
            AutherEmail = b.Author?.Email
        });
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<BlogResponse>> Create([FromBody] BlogCreateRequest dto)
    {
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var baseSlug = SlugHelper.ToSlug(dto.Title);
        var slug = baseSlug;
        int i = 2;
        while (await _context.BlogPosts.AnyAsync(x => x.Slug == slug))
        {
            slug = $"{baseSlug}-{i}";
            i++;
        }
        var entity = new BlogPost
        {
            Title = dto.Title,
            Slug = slug,
            Content = dto.Content,
            IsPublished = dto.IsPublished,
            AuthorId = uid,
            CreatedAt = DateTime.UtcNow
        };
        _context.BlogPosts.Add(entity);
        await _context.SaveChangesAsync();

        var resp = new BlogResponse
        {
            Title = entity.Title,
            Slug = entity.Slug,
            Content = entity.Content,
            IsPublished = entity.IsPublished,
            AuthorId = entity.AuthorId,
            UpdatedAt = entity.UpdatedAt,
            CreatedAt = DateTime.UtcNow
        };
        return CreatedAtAction(nameof(GetBySlug), new { slug = entity.Slug }, resp);
    }
    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] BlogUpdateRequest dto)
    {
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var entity = await _context.BlogPosts.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return NotFound();

        if (entity.AuthorId != uid) return Forbid(); //403

        if (!string.Equals(entity.Title, dto.Title, StringComparison.Ordinal))
        {
            var baseSlug = SlugHelper.ToSlug(dto.Title);
            var slug = baseSlug;
            int i = 2;
            while (await _context.BlogPosts.AnyAsync(x => x.Slug == slug))
            {
                slug = $"{baseSlug}-{i}";
                i++;
            }
            entity.Slug = slug;
            entity.Title = dto.Title;
        }
        else
        {
            entity.Title = dto.Title;
        }
        entity.Content = dto.Content;
        entity.IsPublished = dto.IsPublished;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var resp = new BlogResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Slug = entity.Slug,
            Content = entity.Content,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsPublished = entity.IsPublished,
            AuthorId = entity.AuthorId,
            AutherFullName = entity.Author?.FullName,
            AutherEmail = entity.Author?.Email
        };

        return Ok(resp);
    }
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult>Delete(int id)
    {
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var entity = await _context.BlogPosts.FirstOrDefaultAsync(x=>x.Id == id);
        if (entity is null) return NotFound();

        if (entity.AuthorId != uid) return Forbid(); //403

        _context.BlogPosts.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}