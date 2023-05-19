using Microsoft.AspNetCore.Mvc;

namespace Stadsdelsdialog.Admin.Controllers
{
    public class SavePointController : Controller
    {
        private readonly IConfiguration config;

        public SavePointController(IConfiguration config)
        {
            this.config = config;
        }

        [HttpPost("api/SavePoint")]
        public int SavePoint([FromBody] SavePointRequest value)
        {
            Application.App a = new Application.App(config);

            a.SavePoint(value.Question, value.value, value.X, value.Y, value.Stadsdel);

            return 1;
        }
    }

    public class SavePointRequest
    {
        public string Question { get; set; } = "";
        public string value { get; set; } = "";
        public string X { get; set; } = "";
        public string Y { get; set; } = "";
        public string Stadsdel { get; set; } = "";
    }
}
