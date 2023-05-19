using Microsoft.AspNetCore.Mvc;

namespace Stadsdelsdialog.Web.Controllers
{
    public class KartaController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
