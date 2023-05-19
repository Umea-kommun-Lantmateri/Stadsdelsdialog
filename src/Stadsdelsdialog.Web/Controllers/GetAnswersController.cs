using Microsoft.AspNetCore.Mvc;
using Stadsdelsdialog.Domain;

namespace Stadsdelsdialog.Web.Controllers
{
    public class GetAnswersController : Controller
    {
        private readonly IConfiguration config;

        public GetAnswersController(IConfiguration config)
        {
            this.config = config;
        }

        [HttpGet("api/GetAnswers")]
        public List<Answer> GetAnswers()
        {
            List<Answer> answer = new Application.App(config).GetAnswers();

            return answer;
        }

    }
}
