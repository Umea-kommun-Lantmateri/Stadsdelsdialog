using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Stadsdelsdialog.Web.Controllers
{
    public class AnmalController
    {
        private readonly IConfiguration config;

        public AnmalController(IConfiguration config)
        {
            this.config = config;
        }

        [HttpPost("api/Anmal")]
        public string Anmal([FromBody] AnmalRequest data)
        {
            Application.App a = new Application.App(config);

            a.Anmal(data.Question, data.Value, data.Created);

            return "OK";
        }
    }

    public class AnmalRequest
    {
        public string Question { get; set; } = "";
        public string Value { get; set; } = "";
        public string Created { get; set; } = "";
    }
}
