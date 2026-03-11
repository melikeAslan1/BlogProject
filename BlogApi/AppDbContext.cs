namespace BlogApi.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using BlogApi.Models;


public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
   
   public DbSet<BlogPost> BlogPosts { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<BlogPost>()
            .HasIndex(b => b.Slug)
            .IsUnique();
        
        builder.Entity<BlogPost>()
        .HasIndex(b => b.AuthorId);
    }
    
}