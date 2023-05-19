using Stadsdelsdialog.Application;
using Stadsdelsdialog.Domain;

namespace Stadsdelsdialog.Admin.Models
{
    public class HomeModel
    {
        public TotalStats TotalStats { get; internal set; }
        public List<QuestionItem> Points { get; internal set; }
        public List<Word> Words { get; internal set; }
        public int PageSize { get; internal set; }
    }
}
