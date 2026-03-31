using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlogApi.Data;
using BlogApi.Dtos;
using BlogApi.Models;
using BlogApi.Search;
using BlogApi.Utils;
using BlogApi.Cache;

namespace YoboApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<AppUser> _userManager;
    private readonly IBlogSearchService _search;
    private readonly IFeaturedPostsCache _featuredCache;

    public BlogController(AppDbContext context, UserManager<AppUser> userManager, IBlogSearchService search, IFeaturedPostsCache featuredCache)
    {
        _context = context;
        _userManager = userManager;
        _search = search;
        _featuredCache = featuredCache;
    }

    [HttpGet("featured")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<BlogResponse>>> Featured()
    {
        // Önce Redis cache dene
        var cached = await _featuredCache.GetAsync();
        if (cached is { Count: > 0 })
            return Ok(cached);

        var items = await _context.BlogPosts
            .Where(b => b.IsPublished)
            .OrderByDescending(b => b.CreatedAt)
            .Take(3)
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
        }).ToList();

        await _featuredCache.SetAsync(result);
        return Ok(result);
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

        if (_search.IsEnabled && !string.IsNullOrWhiteSpace(q))
        {
            var hits = await _search.SearchAsync(q.Trim(), authorId, isPublished, page, pageSize);
            if (hits != null)
            {
                if (hits.OrderedIds.Count == 0)
                    return Ok(Array.Empty<BlogResponse>());

                var posts = await _context.BlogPosts
                    .Include(b => b.Author)
                    .Where(b => hits.OrderedIds.Contains(b.Id))
                    .ToListAsync();

                var rank = hits.OrderedIds.Select((id, idx) => (id, idx)).ToDictionary(x => x.id, x => x.idx);
                posts.Sort((a, b) => rank[a.Id].CompareTo(rank[b.Id]));

                var esResult = posts.Select(b => new BlogResponse
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
                return Ok(esResult);
            }
        }

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

        var created = await _context.BlogPosts
            .Include(b => b.Author)
            .FirstAsync(b => b.Id == entity.Id);
        await _search.IndexPostAsync(BlogPostSearchMapper.FromEntity(created));

        var resp = new BlogResponse
        {
            Id = created.Id,
            Title = created.Title,
            Slug = created.Slug,
            Content = created.Content,
            IsPublished = created.IsPublished,
            AuthorId = created.AuthorId,
            UpdatedAt = created.UpdatedAt,
            CreatedAt = created.CreatedAt,
            AutherFullName = created.Author?.FullName,
            AutherEmail = created.Author?.Email
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

        var updated = await _context.BlogPosts
            .Include(b => b.Author)
            .FirstAsync(b => b.Id == id);
        await _search.IndexPostAsync(BlogPostSearchMapper.FromEntity(updated));

        var resp = new BlogResponse
        {
            Id = updated.Id,
            Title = updated.Title,
            Slug = updated.Slug,
            Content = updated.Content,
            CreatedAt = updated.CreatedAt,
            UpdatedAt = updated.UpdatedAt,
            IsPublished = updated.IsPublished,
            AuthorId = updated.AuthorId,
            AutherFullName = updated.Author?.FullName,
            AutherEmail = updated.Author?.Email
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

        var postId = entity.Id;
        _context.BlogPosts.Remove(entity);
        await _context.SaveChangesAsync();
        await _search.DeletePostAsync(postId);
        return NoContent();
    }
}