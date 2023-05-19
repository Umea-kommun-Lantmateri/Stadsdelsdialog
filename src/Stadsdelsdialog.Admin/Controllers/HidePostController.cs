using Microsoft.AspNetCore.Mvc;

namespace Stadsdelsdialog.Admin.Controllers
{
    public class HidePostController : Controller
    {
        private readonly IConfiguration config;

        public HidePostController(IConfiguration config)
        {
            this.config = config;
        }

        [HttpGet("api/HidePost/{id}")]
        public int HidePost(int id)
        {
            Application.App a = new Application.App(config);

            return a.HidePost(id);
        }


    }
}
