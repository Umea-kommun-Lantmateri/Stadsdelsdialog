using Microsoft.Extensions.Configuration;
using System.Net.Mail;
using UniqueIdGenerator.Net;
using Stadsdelsdialog.Domain;

namespace Stadsdelsdialog.Application
{
    public class Tools
    {
        public static string IsDBNullString(object value, string DefualtValue = "")
        {
            if (DBNull.Value == value)
            {
                return DefualtValue;
            }

            return (string)value;
        }

        public static string ToBase62(ulong number)
        {
            string alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            ulong n = number;
            ulong basis = 62;
            string ret = "";

            while (n > 0)
            {
                ulong temp = n % basis;
                ret = alphabet[System.Convert.ToInt32(temp)] + ret;

                n = (n / basis);
            }

            return ret;
        }
        public static string GetRandomID()
        {
            Generator gen = new Generator(5, new DateTime(2019, 9, 18, 16, 0, 0));
            return ToBase62(gen.NextLong());
        }

        public static int GetStat(List<StatsItem> Stats, string Stadsdel, string typ)
        {
            foreach (var item in Stats)
            {
                if (item.Stadsdel == Stadsdel)
                {
                    foreach (var itm in item.Stats)
                    {
                        if (itm.Typ == typ)
                        {
                            return itm.Value;
                        }
                    }

                    break;
                }
            }

            return 0;
        }

        public static void SendMail(IConfiguration configuration, List<string> MailTos, string Subject, string body, bool IsBodyHtml = true)
        {
            SmtpClient mailServer = new SmtpClient();

            mailServer.Host = configuration["AppSettings:Mail_Server"]!;
            mailServer.Port =int.Parse( configuration["AppSettings:Mail_Port"]!);
            MailAddress _From = new MailAddress(configuration["AppSettings:Mail_From"]!);

            MailMessage mail = new MailMessage();
            mail.From = _From;

            foreach (string item in MailTos)
            {
                if (!string.IsNullOrEmpty(item))
                {
                    mail.To.Add(item);
                }
            }

            mail.Subject = Subject;

            mail.Body = body;

            mail.IsBodyHtml = IsBodyHtml;
            mailServer.Send(mail);


            mail.Dispose();
            mailServer.Dispose();
        }

        public static string IfWrite(bool exp, string WriteIfTrue, string WriteIfFalse)
        {
            if (exp)
            {
                return WriteIfTrue;
            }

            return WriteIfFalse;
        }

    }

}
