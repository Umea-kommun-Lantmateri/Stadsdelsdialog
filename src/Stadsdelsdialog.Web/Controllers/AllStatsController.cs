using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Stadsdelsdialog.Web.Controllers
{
    public class AllStatsController
    {
        private readonly IConfiguration config;

        public AllStatsController(IConfiguration config)
        {
            this.config = config;
        }

        [HttpGet("api/AllStats")]
        public object AllStats()
        {
            Application.App a = new Application.App(config);

            return a.GetStats();
        }
    }
}
