using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;

namespace Stadsdelsdialog.Application
{
    public class Auth
    {
        private static int ExpireDays = 14;
        private static string SessionCookieName = "Stadsdelsdialog.Session";

        public IConfiguration Configuration { get; }
        public SqlConnection DB { get; set; }

        public Auth(IConfiguration config)
        {
            this.Configuration = config;
        }

        public bool Login(string username, string password, HttpResponse response)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                return false;
            }

            string OwnerUsername = Configuration["AppSettings:Username"];
            string OwnerPassword = Configuration["AppSettings:Password"];

            if (username.ToLower() == OwnerUsername.ToLower() && password == OwnerPassword)
            {
                CreateSessionCookie(Configuration["AppSettings:SessionHash"]!, response);
            }

            return false;
        }

        public bool CheckSession(HttpRequest request, HttpResponse response)
        {
            string session = request.Cookies[SessionCookieName];

            if (session != null)
            {
                if (session == Configuration["AppSettings:SessionHash"])
                {
                    CreateSessionCookie(Configuration["AppSettings:SessionHash"]!, response);

                    return true;
                }
            }

            return false;
        }


        private static void CreateSessionCookie(string session, HttpResponse response)
        {
            response.Cookies.Append(SessionCookieName, session, new CookieOptions()
            {
                Expires = DateTime.Now.AddDays(ExpireDays),
                SameSite = SameSiteMode.Strict,
                Secure = false,
                HttpOnly = false,
                IsEssential = true
            });
        }

    }
}
