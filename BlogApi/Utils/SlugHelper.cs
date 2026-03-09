using System.Text.RegularExpressions;
namespace BlogApi.Utils;
public static class SlugHelper
{
    public static string ToSlug(string text)
    {
        text = text.ToLowerInvariant().Trim();

        text = text.Replace("ş", "s")
                   .Replace("ı", "i")
                   .Replace("ğ", "g")
                   .Replace("ü", "u")
                   .Replace("ö", "o")
                   .Replace("ç", "c")
                   .Replace("Ş", "s")
                   .Replace("İ", "i")
                   .Replace("Ğ", "g")
                   .Replace("Ü", "u")
                   .Replace("Ö", "o")
                   .Replace("Ç", "c"); 

        text = Regex.Replace(text, @"[^a-z0-9\s-]", "");
        text = Regex.Replace(text, @"\s+", " ").Trim(); 
        text = Regex.Replace(text, @"-+", "-");
        return text;
    }
}