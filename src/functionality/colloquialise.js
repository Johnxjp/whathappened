const trading_endings = new RegExp(
  /((inc(orporated)?|technologies|plc|& co(mpany)?|int(ernationa|')l|corp(oration)?|co(mpany)?|ltd|limited|group|cos|class \w{1})([\s,.]?)+)+$|\.com|^the /gi
);

export default function colloquialise(company_name) {
  company_name = company_name.trim().replace(trading_endings, "");
  company_name = company_name.trim().trimRight(",.");

  // Special cases
  if (company_name === "E*Trade") {
    company_name = company_name.replace(/\*/, "-");
  }

  if (company_name === "International Business Machines") {
    company_name = "IBM";
  }

  return company_name;
}
