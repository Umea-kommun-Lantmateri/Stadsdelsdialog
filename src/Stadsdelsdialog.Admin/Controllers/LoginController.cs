using Microsoft.AspNetCore.Mvc;
using Stadsdelsdialog.Application;

namespace Stadsdelsdialog.Admin.Controllers
{
    public class LoginController : Controller
    {
        private readonly IConfiguration config;

        public LoginController(IConfiguration config)
        {
            this.config = config;
        }

        public IActionResult Index()
        {
            string err = Request.Query["err"];

            if (err != null)
            {
                ViewBag.Error = err;
            }


            return View();
        }

        [HttpPost()]
        public ActionResult Create(IFormCollection collection)
        {
            Auth auth = new Auth(config);

            if (auth.Login(collection["username"], collection["password"], Response))
            {
                return Redirect("~/");
            }
            else
            {
                return RedirectToAction("Index", new { err = 1 });
            }
        }
    }
}
