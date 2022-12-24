from datetime import date


d = date(2022, 2, 1)
# print(d.strftime("%m.%d.%Y"))



table = {"a": 1, "b": 2, "c": 3}
# print(sorted(table, key=table.get, reverse=True))



numbers = (1, 2, 3)
for n in numbers:
    print("C"*n)