using Microsoft.AspNetCore.Mvc;

namespace Stadsdelsdialog.Admin.Controllers
{
    public class FysiskEnkatController : Controller
    {
        private readonly IConfiguration config;

        public FysiskEnkatController(IConfiguration config)
        {
            this.config = config;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost("FysiskEnkat/Stadsdel20")]
        public IActionResult Stadsdel20(IFormCollection collection)
        {
            Application.App a = new Application.App(config);

            a.Stadsdel20(collection["text"], collection["stadsdel"]);

            return View();
        }

        [HttpPost("FysiskEnkat/Saknade")]
        public ActionResult Saknade(IFormCollection collection)
        {
            try
            {
                Application.App a = new Application.App(config);

                List<string> values = new List<string>();

                if (collection.ContainsKey("checkbox1"))
                {
                    values.Add(collection["checkbox1"]);
                }

                if (collection.ContainsKey("checkbox2"))
                {
                    values.Add(collection["checkbox2"]);
                }

                if (collection.ContainsKey("checkbox3"))
                {
                    values.Add(collection["checkbox3"]);
                }

                if (collection.ContainsKey("checkbox4"))
                {
                    values.Add(collection["checkbox4"]);
                }

                if (collection.ContainsKey("checkbox5"))
                {
                    values.Add(collection["checkbox5"]);
                }

                if (collection.ContainsKey("checkbox6"))
                {
                    values.Add(collection["checkbox6"]);
                }

                if (collection.ContainsKey("checkbox7"))
                {
                    values.Add(collection["checkbox7"]);
                }

                if (collection.ContainsKey("checkbox8"))
                {
                    values.Add(collection["checkbox8"]);
                }

                if (collection.ContainsKey("checkbox9"))
                {
                    values.Add(collection["checkbox9"]);
                }

                if (collection.ContainsKey("checkbox10"))
                {
                    values.Add(collection["checkbox10"]);
                }

                a.Saknade(values, collection["stadsdel"]);

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }
    }
}
