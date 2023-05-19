using Microsoft.AspNetCore.Mvc;

namespace Stadsdelsdialog.Admin.Controllers
{
    public class SetkategoriController : Controller
    {
        private readonly IConfiguration config;

        public SetkategoriController(IConfiguration config)
        {
            this.config = config;
        }

        // POST: api/Setkategori
        [HttpPost("api/Setkategori")]
        public string PostValue([FromBody()] SetkategoriRequest value)
        {
            if (new Stadsdelsdialog.Application.Auth(config).CheckSession(Request, Response) == false)
            {
                return "Fail";
            }

            Application.App a = new Application.App(config);

            a.Setkategori(value.ID, value.Value);

            return "OK";
        }
    }

    public class SetkategoriRequest
    {
        public int ID { get; set; } = -1;
        public string Value { get; set; } = "";
    }
}
