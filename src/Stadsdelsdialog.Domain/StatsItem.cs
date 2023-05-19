namespace Stadsdelsdialog.Domain
{
    public class StatsItem
    {
        public string Stadsdel { get; set; } = "";
        public List<StatsItemItem> Stats { get; set; } = new List<StatsItemItem>();
    }

}
