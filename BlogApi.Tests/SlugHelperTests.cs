using BlogApi.Utils;
using Xunit;

namespace BlogApi.Tests
{
    public class SlugHelperTests
    {
        [Theory]
        [InlineData("Merhaba Dünya", "merhaba-dunya")]
        [InlineData("  Çok  güzel! Yazı.  ", "cok-guzel-yazi")]
        [InlineData("Test -- Çok!! ##", "test-cok")]
        [InlineData("İstanbul", "istanbul")]
        [InlineData("Çalışma Örneği", "calisma-ornegi")]
        public void ToSlug_ProducesExpectedSlug(string input, string expected)
        {
            // Act
            var actual = SlugHelper.ToSlug(input);

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
