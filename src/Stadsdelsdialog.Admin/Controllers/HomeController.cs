using Microsoft.AspNetCore.Mvc;
using Stadsdelsdialog.Admin.Models;
using Stadsdelsdialog.Application;
using System.Diagnostics;

namespace Stadsdelsdialog.Admin.Controllers
{
    public class HomeController : Controller
    {
        private readonly IConfiguration config;

        public HomeController(IConfiguration config)
        {
            this.config = config;
        }

        // GET: Home
        public ActionResult Index(int Page = 0)
        {
            if (new Stadsdelsdialog.Application.Auth(config).CheckSession(Request, Response) == false)
            {
                return RedirectToAction("index", "Login");
            }

            if (Page != 0)
            {
                Page -= 1;
            }

            ViewData["Page"] = Page;

            App a = new App(config);

            return View(new HomeModel() { TotalStats = a.GetTotalStats(), Points = a.GetPoints(Page), Words = a.GetWords(), PageSize = a.PageSize });
        }

        [HttpGet("DeleteWord/{id}")]
        public ActionResult DeleteWord(int id)
        {
            Stadsdelsdialog.Application.App a = new Stadsdelsdialog.Application.App(config);

            a.DeleteWord(id);

            return Redirect("/");
        }

        // POST: Home/Create
        [HttpPost()]
        public ActionResult AddWord(IFormCollection collection)
        {
            try
            {
                Stadsdelsdialog.Application.App a = new Stadsdelsdialog.Application.App(config);

                a.AddWord(collection["ord"]!);


                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }



        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}