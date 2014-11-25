#!/usr/bin/python
import nfldb
import nflgame
import nflgame.player
import nflgame.update_players
import json
import re

variable ={"home_turnovers":8,"fumbles_tot":10,"passing_att":351,"puntret_yds":149,"kickret_fair":0,"kicking_fgmissed_yds":0,"puntret_fair":15,"defense_xpblk":0,"kicking_i20":5,"passing_int":9,"puntret_touchback":0,"defense_fgblk":0,"rushing_twopta":1,"receiving_yac_yds":1223,"fumbles_notforced":2,"receiving_yds":2751,"rushing_att":231,"rushing_twoptm":0,"rushing_twoptmissed":1,"defense_misc_yds":1,"passing_twoptm":0,"passing_twopta":0,"punting_yds":1438,"defense_misc_tds":0,"defense_frec_yds":7,"receiving_twopta":0,"passing_incmp":124,"rushing_loss_yds":0,"team":"IND","punting_tot":30,"home_wins":3,"receiving_tds":22,"kicking_all_yds":3037,"puntret_tot":21,"passing_yds":2751,"fumbles_rec_tds":0,"away_score_q1":37,"passing_twoptmissed":0,"rushing_yds":916,"passing_cmp_air_yds":1528,"defense_puntblk":1,"draws":0,"home_score_q1":27,"kicking_xpmissed":0,"defense_safe":0,"rushing_tds":6,"defense_pass_def":41,"kicking_yds":3313,"score":250,"home_losses":1,"passing_sk":13,"defense_frec_tds":0,"rushing_loss":0,"kickret_touchback":0,"punting_blk":0,"kicking_downed":0,"losses":3,"kickret_ret":14,"passing_incmp_air_yds":1395,"offense_tds":50,"fumbles_oob":0,"away_wins":2,"defense_sk_yds":-116,"fumbles_lost":6,"offense_yds":6407,"kicking_tot":53,"receiving_twoptmissed":0,"receiving_rec":227,"defense_qbhit":42,"punting_i20":13,"defense_tkl_primary":16,"away_turnovers":6,"defense_tkl_loss":34,"passing_cmp":227,"kicking_touchback":41,"defense_ffum":9,"punting_touchback":1,"puntret_tds":0,"defense_int_tds":1,"score_q2":73,"score_q3":54,"score_q1":64,"score_q4":59,"score_q5":0,"home_draws":0,"kicking_fgb":0,"kicking_fga":16,"away_losses":2,"kicking_fgm":16,"defense_ast":112,"defense_frec":8,"defense_int_yds":83,"defense_tkl":325,"kickret_tds":0,"player_id":None,"kicking_xpa":27,"kicking_xpb":0,"rushing_ypc":3.97,"passing_sk_yds":-59,"fumbles_forced":8,"kickret_yds":368,"defense_sk":20,"away_draws":0,"defense_int":6,"kicking_rec":3,"receiving_twoptm":0,"receiving_tar":344,"kicking_rec_tds":0,"kickret_oob":0,"defense_tkl_loss_yds":150,"away_score_q2":47,"away_score_q3":23,"home_score_q5":0,"home_score_q4":31,"home_score_q3":31,"home_score_q2":26,"away_score_q4":28,"away_score_q5":0,"kicking_xpmade":27,"home_score":115,"puntret_downed":0,"puntret_oob":0,"turnovers":14,"defense_tds":1,"kicking_fgm_yds":535,"wins":5,"fumbles_rec":4,"receiving_ypc":12.12,"kicking_fgmissed":0,"points":381,"fumbles_rec_yds":-11,"passing_tds":22,"away_score":135,"index":0}

main_arr = {
	"passing":[], "rushing":[], "receiving":[], "punting":[], "puntret":[],
	"kicking":[], "kickret":[], "fumbles":[], "defense":[],
}

def players_for_team(team):
	for key in variable.keys():
		m = re.search('(.*)_.*', key)
		if m is not None:
			part = m.group(1).strip()
			if part in main_arr.keys():
				main_arr[part].append(key)

#print_players("NYG")
players_for_team("SF")
print main_arr
