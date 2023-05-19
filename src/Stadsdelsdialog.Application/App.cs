using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using System.Web;
using Stadsdelsdialog.Domain;

namespace Stadsdelsdialog.Application
{
    public class App
    {
        public int PageSize { get; set; } = 300;

        public IConfiguration Configuration { get; }
        public SqlConnection DB { get; set; }

        public App(IConfiguration config)
        {
            this.Configuration = config;

            DB = new SqlConnection(Configuration.GetConnectionString("DBConnectionString"));
        }


        public void Save(List<QuestionItem> Questions)
        {
            int ShowPublic = 0;

            foreach (var item in Questions)
            {
                if (item.Question == "Public" && item.value == "OK")
                {
                    ShowPublic = 1;
                }
            }

            DB.Open();

            var BadWords = GetWords(false);

            string UserID = Tools.GetRandomID();

            QuestionItem last = new QuestionItem();

            foreach (var item in Questions)
            {
                if (item.Question == "GDPR" || item.Question == "Public")
                {
                    continue;
                }

                if (item.Question == last.Question && item.value == last.value && item.X == last.X && item.Y == last.Y)
                {
                    continue;
                }

                foreach (var w in BadWords)
                {
                    if (item.value.Contains(" " + w.Ord + " "))
                    {
                        ShowPublic = 0;
                        break;
                    }
                }


                using (SqlCommand com = new SqlCommand("INSERT INTO Projektkarta_Enkat (Question, value, X, Y, Stadsdel, UserID, Show, AdminActionDate, Created) VALUES (@Question, @value, @X, @Y, @Stadsdel, @UserID, @Show, @AdminActionDate, @Created)", DB))
                {
                    com.Parameters.AddWithValue("Question", item.Question);
                    com.Parameters.AddWithValue("value", item.value);
                    com.Parameters.AddWithValue("X", item.X);
                    com.Parameters.AddWithValue("Y", item.Y);
                    com.Parameters.AddWithValue("Stadsdel", item.Stadsdel);
                    com.Parameters.AddWithValue("UserID", UserID);
                    com.Parameters.AddWithValue("Show", ShowPublic);
                    com.Parameters.AddWithValue("AdminActionDate", "");
                    com.Parameters.AddWithValue("Created", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));

                    com.ExecuteNonQuery();

                    com.Dispose();
                }


                last = item;
            }






            DB.Close();
        }

        public void SavePoint(string Question, string Text, string X, string Y, string Stadsdel)
        {
            DB.Open();

            using (SqlCommand com = new SqlCommand("INSERT INTO Projektkarta_Enkat (Question, value, X, Y, UserID, Show, Stadsdel, Created) VALUES (@Question, @value, @X, @Y, @UserID, @Show, @Stadsdel, @Created)", DB))
            {
                com.Parameters.AddWithValue("Question", Question);
                com.Parameters.AddWithValue("value", Text);
                com.Parameters.AddWithValue("X", X);
                com.Parameters.AddWithValue("Y", Y);
                com.Parameters.AddWithValue("UserID", "Admin");
                com.Parameters.AddWithValue("Show", "1");
                com.Parameters.AddWithValue("Stadsdel", Stadsdel);
                com.Parameters.AddWithValue("Created", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));

                com.ExecuteNonQuery();
            }

            DB.Close();
        }

        public enum PointType
        {
            Bra = 1,
            Dåligt = 2
        }

        public List<QuestionSmall> GetPoints(PointType type)
        {
            List<QuestionSmall> result = new List<QuestionSmall>();
            DB.Open();

            string sql = "SELECT * FROM Projektkarta_Enkat";

            if (type == PointType.Bra)
            {
                sql += " WHERE Question = 'Var i din stadsdel trivs du bäst?' AND Show = 1 ORDER BY Created desc";
            }
            else
            {
                sql += " WHERE Question = 'Vilka platser trivs du inte på?' AND Show = 1 ORDER BY Created desc";
            }

            using (SqlCommand com = new SqlCommand(sql, DB))
            {
                using (var dr = com.ExecuteReader())
                {
                    while (dr.Read())
                    {
                        string datum = Tools.IsDBNullString(dr["Created"]);

                        var d = DateTime.Now.AddDays(-2);

                        try
                        {
                            string[] s = datum.Split(" ")[0].Split("-");
                            string[] s2 = datum.Split(" ")[1].Split(":");
                            // Dim d = DateTime.Parse(datum)
                            d = new DateTime(int.Parse(s[0]), int.Parse(s[1]), int.Parse(s[2]), int.Parse(s2[0]), int.Parse(s2[1]), int.Parse(s2[2]), 0, DateTimeKind.Local);


                            datum = d.ToString("yyyy-MM-dd HH:mm:ss");
                        }
                        catch (Exception ex)
                        {
                        }

                        if (DateTime.Now.Hour > 17 && DateTime.Now.Hour < 8 && d.ToString("yyyy-MM-dd") == DateTime.Now.ToString("yyyy-MM-dd") && d.Hour > 17 && d.Hour < 8)
                        {
                        }
                        else
                        {
                            string Anmal = Tools.IsDBNullString(dr["Anmald"]);

                            if (!string.IsNullOrEmpty(Anmal))
                            {
                                Anmal = "1";
                            }

                            string TypeRes = "Digital";
                            if (Tools.IsDBNullString(dr["UserID"]) == "Admin")
                            {
                                TypeRes = "Fysisk";
                            }

                            result.Add(new QuestionSmall()
                            {
                                Question = HttpUtility.HtmlEncode(Tools.IsDBNullString(dr["Question"])),
                                value = HttpUtility.HtmlEncode(Tools.IsDBNullString(dr["value"])),
                                X = Tools.IsDBNullString(dr["X"]),
                                Y = Tools.IsDBNullString(dr["Y"]),
                                Stadsdel = Tools.IsDBNullString(dr["Stadsdel"]),
                                Anmal = Anmal,
                                Created = datum,
                                Type = TypeRes
                            });
                        }
                    }

                    dr.Close();
                }

                com.Dispose();
            }

            DB.Close();
            return result;
        }

        private bool IsOther(string value)
        {
            if (value == "Det egna hemmet")
            {
                return false;
            }

            if (value == "Föreningar och grupper i området")
            {
                return false;
            }

            if (value == "Grannarna")
            {
                return false;
            }

            if (value == "Kulturutbudet (tex bibliotek, folkets hus osv)")
            {
                return false;
            }

            if (value == "Lugnet")
            {
                return false;
            }

            if (value == "Naturen")
            {
                return false;
            }

            if (value == "Servicen i närheten (tex butiker)")
            {
                return false;
            }

            if (value == "Tryggheten")
            {
                return false;
            }

            if (value == "Uteplatserna/mötesplatser i utemiljön")
            {
                return false;
            }

            if (value == "Den speciella stämningen/andan/atmosfär som finns här")
            {
                return false;
            }

            return true;
        }

        public List<StatsItem> GetStats()
        {
            List<StatsItem> result = new List<StatsItem>();

            try
            {
                DB.Open();

                using (SqlCommand com = new SqlCommand("SELECT * FROM Projektkarta_Enkat WHERE Question = 'Vad skulle du sakna mest med din stadsdel om du flyttade?'", DB))
                {
                    using (var dr = com.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            string value = Tools.IsDBNullString(dr["value"]);
                            string Stadsdel = Tools.IsDBNullString(dr["Stadsdel"]);

                            bool Stadsdel_exist = false;

                            foreach (var item in result)
                            {
                                if (item.Stadsdel == Stadsdel)
                                {
                                    Stadsdel_exist = true;

                                    bool StatExist = false;

                                    foreach (var itm in item.Stats)
                                    {
                                        if (itm.Typ == value)
                                        {
                                            itm.Value += 1;
                                            StatExist = true;
                                            break;
                                        }
                                    }

                                    if (IsOther(value))
                                    {
                                        foreach (var itm in item.Stats)
                                        {
                                            if (itm.Typ == "Annat")
                                            {
                                                itm.Value += 1;
                                            }
                                        }

                                        StatExist = true;
                                    }

                                    if (StatExist == false)
                                    {
                                        item.Stats.Add(new StatsItemItem() { Typ = value, Value = 1 });
                                    }

                                    break;
                                }
                            }

                            if (Stadsdel_exist == false)
                            {
                                StatsItem itm = new StatsItem();
                                itm.Stadsdel = Stadsdel;

                                if (IsOther(value))
                                {
                                    itm.Stats.Add(new StatsItemItem() { Typ = "Annat", Value = 1 });
                                }
                                else
                                {
                                    itm.Stats.Add(new StatsItemItem() { Typ = "Annat", Value = 0 });
                                    itm.Stats.Add(new StatsItemItem() { Typ = value, Value = 1 });
                                }

                                result.Add(itm);
                            }
                        }

                        dr.Close();
                    }

                    com.Dispose();
                }

                DB.Close();


                StatsItem Totalt = new StatsItem();
                Totalt.Stadsdel = "Umeå kommun";

                foreach (var item in result)
                {
                    foreach (var oi in item.Stats)
                    {
                        bool StatExist = false;

                        foreach (var ti in Totalt.Stats)
                        {
                            if (oi.Typ == ti.Typ)
                            {
                                ti.Value += oi.Value;
                                StatExist = true;
                                break;
                            }
                        }

                        if (StatExist == false)
                        {
                            Totalt.Stats.Add(new StatsItemItem() { Typ = oi.Typ, Value = oi.Value });
                        }
                    }
                }

                result.Add(Totalt);

                int tot = 0;
                foreach (var item in result)
                {
                    if (item.Stadsdel != "Umeå kommun")
                    {
                        foreach (var itm in item.Stats)
                        {
                            tot += itm.Value;
                        }
                    }
                }


                foreach (var item in result)
                {
                    int total = 0;

                    foreach (var itm in item.Stats)
                    {
                        total += itm.Value;
                    }

                    foreach (var itm in item.Stats)
                    {
                        itm.Value = (itm.Value / total) * 100;
                    }
                }
            }
            catch (Exception ex)
            {
            }

            return result;
        }

        public List<Answer> GetAnswers()
        {
            List<Answer> result = new List<Answer>();

            DB.Open();

            using (SqlCommand com = new SqlCommand("SELECT TOP 15 * FROM Projektkarta_Enkat WHERE Question = 'Vad skulle du önska för din stadsdel om 20 år?' AND Show = 1 ORDER BY Created DESC", DB))
            {
                using (var dr = com.ExecuteReader())
                {
                    while (dr.Read())
                    {

                        result.Add(new Answer()
                        {
                            value = Tools.IsDBNullString(dr["value"]),
                            Stadsdel = Tools.IsDBNullString(dr["Stadsdel"]),
                            Created = Tools.IsDBNullString(dr["Created"])
                        });

                    }

                    dr.Close();
                }

                com.Dispose();
            }

            DB.Close();

            return result;
        }

        public void Anmal(string Question, string Value, string Created)
        {
            // Try

            DB.Open();

            int ID = -1;

            using (SqlCommand com = new SqlCommand("SELECT ID FROM Projektkarta_Enkat WHERE Question=@Question AND Value=@Value AND Created=@Created", DB))
            {
                com.Parameters.AddWithValue("Question", Question);
                com.Parameters.AddWithValue("Value", Value);
                com.Parameters.AddWithValue("Created", Created);

                ID = (int)com.ExecuteScalar();
            }

            using (SqlCommand com = new SqlCommand("UPDATE Projektkarta_Enkat SET Anmald=@Anmald WHERE Question=@Question AND Value=@Value AND Created=@Created", DB))
            {
                com.Parameters.AddWithValue("Anmald", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
                com.Parameters.AddWithValue("Question", Question);
                com.Parameters.AddWithValue("Value", Value);
                com.Parameters.AddWithValue("Created", Created);

                com.ExecuteNonQuery();
            }

            DB.Close();

            if (ID != -1)
            {
                string body = System.IO.File.ReadAllText(System.Environment.CurrentDirectory + @"\Mail_Template\Anmald2.html");

                body = body.Replace("{{Question}}", Question);
                body = body.Replace("{{Text}}", Value);
                body = body.Replace("{{Hide}}", Configuration["AppSettings:RootPath"] + "Admin_Hide/" + ID);

                List<string> Emails = Configuration["AppSettings:Mail_To"]!.Split(",").ToList();

                Tools.SendMail(Configuration, Emails, "Projektkartan kommentar", body);
            }
        }

        public int HidePost(int id)
        {
            DB.Open();

            using (SqlCommand com = new SqlCommand("UPDATE Projektkarta_Enkat SET Show=0, AdminActionDate=@AdminActionDate WHERE ID=@ID", DB))
            {
                com.Parameters.AddWithValue("AdminActionDate", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
                com.Parameters.AddWithValue("ID", id);

                com.ExecuteNonQuery();
                com.Dispose();
            }

            DB.Close();

            return id;
        }



        public List<QuestionItem> GetPoints(int Page = 0)
        {
            List<QuestionItem> result = new List<QuestionItem>();


            Page = Page * PageSize;

            string PageSQL = "";


            PageSQL += " OFFSET " + Page + "ROWS FETCH NEXT " + PageSize + " ROWS ONLY ";


            DB.Open();

            using (SqlCommand com = new SqlCommand("SELECT * FROM Projektkarta_Enkat WHERE (Question = 'Var i din stadsdel trivs du bäst?' OR  Question = 'Vilka platser trivs du inte på?' OR Question = 'Vad skulle du önska för din stadsdel om 20 år?') ORDER BY Created DESC " + PageSQL, DB))
            {
                using (var dr = com.ExecuteReader())
                {
                    while (dr.Read())
                    {
                        result.Add(new QuestionItem()
                        {
                            ID = (int)dr["ID"],
                            Question = Tools.IsDBNullString(dr["Question"]),
                            value = Tools.IsDBNullString(dr["value"]),
                            Created = Tools.IsDBNullString(dr["Created"]),
                            UserID = Tools.IsDBNullString(dr["UserID"]),
                            Show = (int)dr["Show"],
                            Stadsdel = Tools.IsDBNullString(dr["stadsdel"]),
                            Stats_kategori = Tools.IsDBNullString(dr["Stats_kategori"])
                        });
                    }

                    dr.Close();
                }

                com.Dispose();
            }

            DB.Close();

            return result;
        }

        public void Stadsdel20(string text, string stadsdel)
        {
            DB.Open();

            using (SqlCommand com = new SqlCommand("INSERT INTO Projektkarta_Enkat (Question, value, UserID, Show, Stadsdel, Created) VALUES (@Question, @value, @UserID, @Show, @Stadsdel, @Created)", DB))
            {
                com.Parameters.AddWithValue("Question", "Vad skulle du önska för din stadsdel om 20 år?");
                com.Parameters.AddWithValue("value", text);
                com.Parameters.AddWithValue("UserID", "Admin");
                com.Parameters.AddWithValue("Show", "1");
                com.Parameters.AddWithValue("Stadsdel", stadsdel);
                com.Parameters.AddWithValue("Created", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));

                com.ExecuteNonQuery();
            }

            DB.Close();
        }

        public void Saknade(List<string> values, string stadsdel)
        {
            DB.Open();

            foreach (string item in values)
            {
                using (SqlCommand com = new SqlCommand("INSERT INTO Projektkarta_Enkat (Question, value, UserID, Show, Stadsdel, Created) VALUES (@Question, @value, @UserID, @Show, @Stadsdel, @Created)", DB))
                {
                    com.Parameters.AddWithValue("Question", "Vad skulle du sakna mest med din stadsdel om du flyttade?");
                    com.Parameters.AddWithValue("value", item);
                    com.Parameters.AddWithValue("UserID", "Admin");
                    com.Parameters.AddWithValue("Show", "1");
                    com.Parameters.AddWithValue("Stadsdel", stadsdel);
                    com.Parameters.AddWithValue("Created", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));

                    com.ExecuteNonQuery();
                    com.Dispose();
                }
            }



            DB.Close();
        }

        public void Setkategori(int ID, string value)
        {
            DB.Open();

            using (SqlCommand com = new SqlCommand("UPDATE Projektkarta_Enkat SET Stats_kategori=@Stats_kategori WHERE ID=@ID", DB))
            {
                com.Parameters.AddWithValue("Stats_kategori", value);
                com.Parameters.AddWithValue("ID", ID);

                com.ExecuteNonQuery();
                com.Dispose();
            }

            DB.Close();
        }

        /// <summary>
        /// Delete word by id
        /// </summary>
        /// <param name="id"></param>
        public void DeleteWord(int id)
        {
            DB.Open();

            using (SqlCommand com = new SqlCommand("DELETE FROM Projektkartan_AutoHideWords WHERE ID=@ID", DB))
            {
                com.Parameters.AddWithValue("ID", id);

                com.ExecuteNonQuery();
            }

            DB.Close();
        }

        /// <summary>
        /// Get All Words that can not exist in a Point and is auto hidden.
        /// </summary>
        /// <param name="OpenDB">Set it to false if you have already opened a dbconnection</param>
        /// <returns></returns>
        public List<Word> GetWords(bool OpenDB = true)
        {
            List<Word> result = new List<Word>();

            try
            {
                if (OpenDB == true)
                {
                    DB.Open();
                }

                using (SqlCommand com = new SqlCommand("SELECT * FROM Projektkartan_AutoHideWords", DB))
                {
                    using (var dr = com.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            result.Add(new Word()
                            {
                                ID = (int)dr["ID"],
                                Ord = Tools.IsDBNullString(dr["Ord"])
                            });
                        }

                        dr.Close();
                    }

                    com.Dispose();
                }

                if (OpenDB == true)
                {
                    DB.Close();
                }
            }
            catch (Exception ex)
            {
            }

            return result;
        }

        /// <summary>
        /// Add a word that cannot be in a Point and is auto hidden.
        /// </summary>
        /// <param name="Ord">bad word</param>
        public void AddWord(string Ord)
        {
            DB.Open();

            using (SqlCommand com = new SqlCommand("INSERT INTO Projektkartan_AutoHideWords (Ord) VALUES (@Ord)", DB))
            {
                com.Parameters.AddWithValue("Ord", Ord);

                com.ExecuteNonQuery();
            }

            DB.Close();
        }

        public TotalStats GetTotalStats()
        {
            TotalStats result = new TotalStats();

            DB.Open();
            using (SqlCommand com = new SqlCommand("SELECT * FROM Projektkarta_Enkat WHERE (Question = 'Var i din stadsdel trivs du bäst?' OR  Question = 'Vilka platser trivs du inte på?' OR Question = 'Vad skulle du önska för din stadsdel om 20 år?')", DB))
            {
                using (var dr = com.ExecuteReader())
                {
                    while (dr.Read())
                    {
                        result.Total += 1;

                        if ((string)dr["Question"] == "Vilka platser trivs du inte på?")
                        {
                            result.Bad += 1;
                        }

                        if ((string)dr["Question"] == "Var i din stadsdel trivs du bäst?")
                        {
                            result.Good += 1;
                        }

                        if ((string)dr["Question"] == "Vad skulle du önska för din stadsdel om 20 år?")
                        {
                            result.Om20 += 1;
                        }

                        string UserID = Tools.IsDBNullString(dr["UserID"]);
                        string Stats_kategori = Tools.IsDBNullString(dr["Stats_kategori"]);

                        bool ex = false;
                        foreach (string sk in result.InSkickat)
                        {
                            if (UserID == sk)
                            {
                                ex = true;
                                break;
                            }
                        }

                        if (ex == false)
                        {
                            result.InSkickat.Add(UserID);
                        }

                        if (Stats_kategori != "")
                        {
                            bool Global_Stats_kategori_Exist = false;
                            foreach (object[] sk in result.Stats_kategori)
                            {

                                if (Stats_kategori == (string)sk[0] && (string)sk[1] == (string)dr["Question"])
                                {
                                    int value = (int)sk[2];

                                    sk[2] = value + 1;
                                    Global_Stats_kategori_Exist = true;
                                    break;
                                }

                            }

                            if (Global_Stats_kategori_Exist == false)
                            {
                                result.Stats_kategori.Add(new object[] { Stats_kategori, dr["Question"], 1 });
                            }
                        }
                    }

                    dr.Close();
                }

                com.Dispose();
            }

            using (SqlCommand com = new SqlCommand("SELECT alder.value as ar, kon.value as kon, Count(*) antal FROM (SELECT Value, UserID FROM Projektkarta_Enkat WHERE Question = '1. Hur gammal är du?') as alder INNER JOIN (SELECT Value,UserID FROM Projektkarta_Enkat WHERE Question = '2. Jag definierar mig som') as kon ON alder.UserID = kon.UserID GROUP BY alder.value, kon.value", DB))
            {
                using (var dr = com.ExecuteReader())
                {
                    while (dr.Read())
                    {
                        result.Alder.Add(new object[] { dr["ar"], dr["antal"], dr["kon"] });
                    }

                    dr.Close();
                }

                com.Dispose();
            }





            DB.Close();

            return result;
        }
    }
}
