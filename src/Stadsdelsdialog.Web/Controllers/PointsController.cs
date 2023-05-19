using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stadsdelsdialog.Application;
using Stadsdelsdialog.Domain;

namespace Stadsdelsdialog.Web.Controllers
{
    public class PointsController : Controller
    {
        private readonly IConfiguration config;

        public PointsController(IConfiguration config)
        {
            this.config = config;
        }

        [HttpGet("api/Points/{type}")]
        public List<QuestionSmall> Details(string type)
        {
            Application.App a = new App(config);

            if (type == "Good")
            {
                return a.GetPoints(Application.App.PointType.Bra);
            } else if (type == "Bad")
            {
                return a.GetPoints(Application.App.PointType.Dåligt);
            }

            return new List<QuestionSmall>();
        }

    }
}
