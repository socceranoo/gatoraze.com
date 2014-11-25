#!/usr/bin/python
from __future__ import division
import nfldb
import nflgame
from nflgame import *
from datetime import *
import json
import sys
import urllib
import urllib2
import re

db = nfldb.connect()
main_keys = [
	"wins",
	"losses",
	"draws"
]
base_keys = [
	"score",
	"score_q1",
	"score_q2",
	"score_q3",
	"score_q4",
	"score_q5",
	"turnovers"
]

def sort_games(q):
	ret = {}
	teamArr = nflgame.teams
	for val in teamArr:
		team = val[0]
		ret[team] = {}
		ret[team]['team'] = team
		for key in base_keys:
			ret[team][key] = 0
			ret[team]["home_"+key] = 0
			ret[team]["away_"+key] = 0
		for key in main_keys:
			ret[team][key] = 0
			ret[team]["home_"+key] = 0
			ret[team]["away_"+key] = 0

	for p in q.as_games():
		result = {}
		if (p.finished != True):
			continue
		for field in p.sql_fields():
			result[field] = getattr(p, field)
		for key in base_keys:
			ret[p.home_team][key] += result["home_"+key]
			ret[p.home_team]["home_"+key] += result["home_"+key]
			ret[p.away_team]["away_"+key] += result["away_"+key]
			ret[p.away_team][key] += result["away_"+key]

		if (p.home_score == p.away_score):
			ret[p.home_team]["home_draws"] += 1
			ret[p.away_team]["away_draws"] += 1
			ret[p.home_team]["draws"] += 1
			ret[p.away_team]["draws"] += 1
		else:
			ret[p.winner]["wins"] += 1
			ret[p.loser]["losses"] += 1
			if p.winner == p.home_team:
				ret[p.winner]["home_wins"] += 1
				ret[p.loser]["away_losses"] += 1
			else:
				ret[p.winner]["away_wins"] += 1
				ret[p.loser]["home_losses"] += 1
	return ret

def sort_list(q, team, ret):
	for p in q.as_aggregate():
		result = {}
		if p.player.team != team:
			continue
		for field in p.sql_fields():
			result[field] = getattr(p, field)
			if (type(result[field]) != type(None)):
				if field not in ret:
					ret[field] = getattr(p, field)
				else:
					ret[field] += result[field]
	ret['receiving_ypc'] = 0
	if (ret['receiving_rec'] != 0):
		ret['receiving_ypc'] = round(ret['receiving_yds']/ret['receiving_rec'], 2)

	ret['rushing_ypc'] = 0
	if (ret['rushing_att'] != 0):
		ret['rushing_ypc'] = round(ret['rushing_yds']/ret['rushing_att'], 2)
	ret['player_id'] = None
	return ret

def team_standings(start_week=1, end_week=18):
	q = nfldb.Query(db)
	q.game(season_year=2014, season_type='Regular', week = range(start_week, end_week))
	ret = sort_games(q)
	teamArr = nflgame.teams
	for val in teamArr:
		team = val[0]
		q = nfldb.Query(db)
		q.game(season_year=2014, season_type='Regular', team=team, week = range(start_week, end_week))
		sort_list(q, team, ret[team])
	data = []
	for key in ret.keys():
		data.append(ret[key])
	print json.dumps(data)

def top_teams(start_week=1, end_week=18):
	data = []
	teamArr = nflgame.teams
	#teamArr = [["IND"]]
	for val in teamArr:
		team = val[0]
		q = nfldb.Query(db)
		q.game(season_year=2014, season_type='Regular', team=team, week = range(start_week, end_week))
		data.append(sort_list(q, team))
	print json.dumps(data)

#top_teams()
team_standings()
