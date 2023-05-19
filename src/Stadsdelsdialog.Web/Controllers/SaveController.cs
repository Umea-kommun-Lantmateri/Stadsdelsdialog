using Microsoft.AspNetCore.Mvc;
using Stadsdelsdialog.Domain;

namespace Stadsdelsdialog.Web.Controllers
{
    public class SaveController
    {
        private readonly IConfiguration config;

        public SaveController(IConfiguration config)
        {
            this.config = config;
        }


        [HttpPost("api/Save")]
        public string Save([FromBody] SaveRequest value)
        {
            Application.App a = new Application.App(config);

            a.Save(value.Questions);

            return "OK";
        }
    }

    public class SaveRequest
    {
        public List<QuestionItem> Questions { get; set; } = new List<QuestionItem>();
    }
}
