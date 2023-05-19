namespace Stadsdelsdialog.Domain
{
    public class Day
    {
        public string Datum { get; set; } = "";
        public List<QuestionItem> Questions { get; set; } = new List<QuestionItem>();
    }

}
