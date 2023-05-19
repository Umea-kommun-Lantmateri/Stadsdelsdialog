using Microsoft.AspNetCore.Mvc;

namespace Stadsdelsdialog.Web.Controllers
{
    public class StatsController : Controller
    {
        private readonly IConfiguration config;

        public StatsController(IConfiguration config)
        {
            this.config = config;
        }

        public IActionResult Index()
        {
            Stadsdelsdialog.Application.App a = new Stadsdelsdialog.Application.App(config);

            return View(a.GetStats());
        }
    }
}
