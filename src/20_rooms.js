/* ===== Raumvorlagen (handgebaut per Code). Typen: start, combat, elite, puzzle, trap, treasure, shrine, secret, boss ===== */
defTpl("start1", "start", 16, 11, B => { B.pts("b", [[2, 2], [13, 2], [2, 8], [13, 8]]); B.sym("o", 4, 3); });
defTpl("start2", "start", 18, 11, B => { B.pts("b", [[2, 2], [15, 8]]); B.symX("o", 5, 5); B.fill(7, 1, 10, 1, "."); });
/* Kampfräume */
defTpl("c_pillars", "combat", 24, 15, B => { for (const [x, y] of [[6, 4], [6, 10], [12, 7], [17, 4], [17, 10]]) B.set(x, y, "o"); B.pts("s", [[5, 7], [18, 7], [9, 3], [14, 11], [11, 7]]); B.pts("r", [[3, 3], [20, 11]]); B.pts("b", [[2, 12], [21, 2]]); });
defTpl("c_cross", "combat", 22, 15, B => { B.fill(9, 5, 12, 9, "~"); B.fill(10, 4, 11, 4, "~"); B.fill(10, 10, 11, 10, "~"); B.pts("s", [[4, 4], [17, 4], [4, 10], [17, 10], [4, 7]]); B.pts("r", [[18, 7], [10, 2], [10, 12]]); B.pts("b", [[2, 2]]); });
defTpl("c_corridor", "combat", 26, 11, B => { for (let x = 6; x <= 19; x += 4) { B.set(x, 3, "o"); B.set(x, 7, "o"); } B.pts("s", [[4, 5], [21, 5], [10, 5], [15, 5], [7, 2], [18, 8]]); B.pts("f", [[12, 2], [13, 8]]); B.pts("b", [[2, 2], [23, 8]]); });
defTpl("c_ring", "combat", 24, 15, B => { B.fill(8, 5, 15, 9, "~"); B.fill(10, 6, 13, 8, "."); B.set(11, 7, "o"); B.pts("s", [[4, 4], [19, 4], [4, 10], [19, 10], [11, 2], [11, 12]]); B.pts("r", [[11, 7], [3, 7]]); B.pts("b", [[21, 7]]); });
defTpl("c_scatter", "combat", 20, 13, B => { for (const [x, y] of [[4, 3], [8, 5], [13, 3], [15, 8], [6, 9], [11, 8], [3, 6]]) B.set(x, y, "o"); B.pts("s", [[9, 3], [14, 5], [5, 7], [12, 10]]); B.pts("f", [[10, 6], [16, 3]]); B.pts("r", [[17, 10]]); });
defTpl("c_hall", "combat", 22, 13, B => { B.fill(5, 4, 5, 8, "o"); B.fill(16, 4, 16, 8, "o"); B.set(5, 6, "."); B.set(16, 6, "."); B.pts("s", [[8, 3], [13, 9], [8, 9], [13, 3], [10, 6]]); B.pts("r", [[19, 3], [19, 9], [2, 6]]); B.pts("b", [[2, 2], [19, 10]]); });
/* Elite */
defTpl("e_arena", "elite", 22, 15, B => { B.sym("o", 5, 4); B.sym("o", 8, 6); B.pts("e", [[11, 7]]); B.pts("s", [[5, 7], [16, 7], [11, 3]]); B.pts("b", [[2, 2], [19, 12]]); });
defTpl("e_pit", "elite", 24, 15, B => { B.fill(10, 6, 13, 8, "~"); B.pts("e", [[11, 3], [12, 11]]); B.pts("r", [[3, 7], [20, 7]]); B.pts("s", [[6, 3], [17, 11]]); B.sym("o", 5, 5); });
/* Rätsel: Käfig mit Truhe, geöffnet durch Kristalle (draufschlagen) oder Platten (draufstellen) */
defTpl("p_crystal", "puzzle", 22, 13, B => { B.ring("g", 9, 4, 12, 8); B.fill(10, 5, 11, 7, "."); B.set(10, 6, "c"); B.pts("y", [[3, 2], [18, 2], [10, 11]]); B.pts("o", [[6, 6], [15, 6]]); B.pts("b", [[2, 10], [19, 10]]); });
defTpl("p_plates", "puzzle", 24, 15, B => { B.ring("g", 10, 5, 13, 9); B.fill(11, 6, 12, 8, "."); B.set(11, 7, "c"); B.pts("x", [[3, 3], [20, 3], [3, 11], [20, 11]]); B.fill(7, 3, 7, 11, "^"); B.fill(16, 3, 16, 11, "^"); B.set(7, 7, "."); B.set(16, 7, "."); B.set(7, 6, "."); B.set(16, 6, "."); });
/* Fallen */
defTpl("t_spikes", "trap", 22, 13, B => { B.fill(7, 3, 14, 9, "^"); B.fill(8, 4, 13, 8, "."); B.fill(9, 5, 12, 7, "^"); B.fill(10, 6, 11, 6, "."); B.set(11, 6, "c"); B.fill(7, 6, 7, 6, "."); B.fill(14, 6, 14, 6, "."); B.fill(11, 3, 11, 3, "."); B.fill(11, 9, 11, 9, "."); B.pts("^", [[4, 2], [4, 10], [18, 2], [18, 10]]); B.pts("b", [[2, 2], [19, 10]]); });
defTpl("t_turrets", "trap", 24, 13, B => { for (const y of [2, 4, 6, 8, 10]) { B.set(0, y, "T"); B.set(23, 12 - y, "T"); } B.sym("o", 6, 3); B.sym("o", 8, 6); B.sym("o", 11, 4); B.pts("c", [[11, 6]]); B.pts("b", [[2, 11], [21, 1]]); });
/* Schatz, Schrein, Geheimraum */
defTpl("treasure1", "treasure", 16, 11, B => { B.pts("c", [[6, 5], [9, 5]]); B.pts("b", [[3, 3], [12, 3], [3, 7], [12, 7]]); });
defTpl("shrine1", "shrine", 16, 11, B => { B.set(7, 5, "h"); B.sym("o", 4, 3); B.pts("b", [[2, 8]]); });
defTpl("secret1", "secret", 12, 9, B => { B.pts("c", [[5, 4], [6, 4]]); B.pts("b", [[2, 2], [9, 2], [2, 6], [9, 6]]); });
defTpl("exit1", "exit", 16, 11, B => { B.pts("c", [[3, 3]]); B.sym("o", 4, 3); });
/* Boss-Arenen */
for (let i = 1; i <= 4; i++) defTpl("boss" + i, "boss", 28, 17, B => { B.sym("o", 6, 4); B.sym("o", 4, 8); B.pts("X", [[14, 8]]); if (i % 2) B.fill(12, 12, 15, 12, "."); else B.fill(10, 4, 17, 4, "."); });
const TPL_BY = {};
for (const id in TPL) (TPL_BY[TPL[id].type] = TPL_BY[TPL[id].type] || []).push(id);
