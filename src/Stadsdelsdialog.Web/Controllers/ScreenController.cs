using Microsoft.AspNetCore.Mvc;

namespace Stadsdelsdialog.Web.Controllers
{
    public class ScreenController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
