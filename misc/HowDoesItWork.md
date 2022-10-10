# How does it works

n - current role 0 <= n <= A
m - current points, 0 <= m <= 1
A - roles count

n = mA, m depends on messeges percentage and calculates every message with one hour cooldown.
Bot register every messages with 5-seconds cooldown and deletes messages older than one week.

There're three ways to calculate m (x - messages percentage):

* m(x) = x^(10^-0.5)
* m(x) = 0.18log2(x)+1
* m(x) = 7.04x^5-20.13x^4+22.41x^3-13.21x^2+4.9x

All this models presented in ActivityColorBotModels.ggb (Open with GeoGebra) as g(x), k(x) and f(x).
