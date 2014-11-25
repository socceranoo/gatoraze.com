#!/usr/bin/python
import nflgame
import nfldb
import json

games = nflgame.games(2014, week=1)
players = nflgame.combine_game_stats(games)
for p in players.receiving().sort('receiving_yds').limit(5):
	p.player = p.player.__dict__
	print json.dumps(p.__dict__)
	#msg = '%s %d carries for %d yards and %d TDs'
	#print msg % (p, p.passing_att, p.passing_yds, p.passing_tds)
teams = nflgame.teams
#for p in teams:
	#print json.dumps(p)
