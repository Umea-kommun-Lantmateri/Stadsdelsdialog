namespace Stadsdelsdialog.Application
{
    public class TotalStats
    {
        public long Total { get; set; } = 0;
        public int Good { get; set; } = 0;
        public int Bad { get; set; } = 0;
        public int Om20 { get; set; } = 0;
        public List<string> InSkickat { get; set; } = new List<string>();
        public List<object[]> Stats_kategori { get; set; } = new List<object[]>();
        public List<object[]> Alder { get; set; } = new List<object[]>();
    }
}
