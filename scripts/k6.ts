import http from "k6/http";
import { check } from "k6";
import type { Options } from "k6/options";

export const options: Options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_duration: [
      "p(25)<100",
      "p(50)<100",
      "p(75)<200",
      "p(90)<300",
      "p(95)<500",
      "p(99)<800",
      "avg<400",
      "max<1000",
      "min>10",
    ],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get("https://api.json.cf/v1/config/UkLWZg9DAJQ7Xl");

  check(res, {
    "status is 200": (r) => r.status === 200,
  });
}
