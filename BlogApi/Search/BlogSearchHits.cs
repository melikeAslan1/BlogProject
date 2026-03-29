namespace BlogApi.Search;

/// <summary>Sorgu sonucu: sıralı yazı Id'leri + toplam eşleşme (sayfalama için).</summary>
public sealed record BlogSearchHits(IReadOnlyList<int> OrderedIds, long TotalCount);
