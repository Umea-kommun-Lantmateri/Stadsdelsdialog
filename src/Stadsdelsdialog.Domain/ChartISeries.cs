namespace Stadsdelsdialog.Domain
{
    public class ChartISeries
    {
        public string name { get; set; } = "";
        public List<ChartISeriesData> data { get; set; } = new List<ChartISeriesData>();
        public string color { get; set; } = "";
    }

}
