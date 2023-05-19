using Microsoft.AspNetCore.Mvc;

namespace Stadsdelsdialog.Web.Controllers
{
    public class SvarController : Controller
    {
        private readonly IConfiguration config;

        public SvarController(IConfiguration config) { 
            this.config = config;
        }


        public IActionResult Index()
        {
            Stadsdelsdialog.Application.App a = new Stadsdelsdialog.Application.App(config);

            return View(a.GetAnswers());
        }
    }
}
