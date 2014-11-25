#!/usr/bin/python
from __future__ import division
import nfldb
import nflgame
from nflgame import *
import json
import sys
import urllib
import urllib2
import re

db = nfldb.connect()
try:
	count = int(sys.argv[1])
except:
	count = 1

try:
	team = sys.argv[2]
except:
	team = None

try:
	debug = sys.argv[3]
except:
	debug = None

#q.game(season_year=2014, season_type='Regular')
#for pp in q.sort('passing_yds').limit(10).as_aggregate():
#	print pp.player, pp.passing_yds

#q.game(season_year=2014, week=1)
#for p in q.sort('passing_yds').limit(40).as_aggregate():
#	print p.player, p.player.team, p.player_id, p.player.profile_id

def print_players(team):
	q = nfldb.Query(db)
	#q.game(season_year=2014, season_type='Regular')
	q.player(team=team)
	for pp in q.as_players():
		print pp.full_name, pp.profile_url

def _min_max(x, xmin, xmax):
	"""
	Defines a function which enforces a minimum and maximum value.
	Input: x, the value to check.
	Input: xmin, the minumum value.
	Input: xmax, the maximum value.
	Output: Either x, xmin or xmax, depending.
	"""
	# Check if x is less than the minimum. If so, return the minimum.
	if x < xmin:
		return xmin

	# Check if x is greater than the maximum. If so, return the maximum.
	elif x > xmax:
		return xmax

	# Otherwise, just return x. And weep for the future.
	else:
		return x

def handle_nfl_passer_rating(att, cmpls, yds, tds, ints):
	""" Defines a function which handles passer rating calculation for the NFL."""
	# Step 0: Make sure these are floats, dammit.
	cmpls = float(cmpls/att)
	yds = float(yds/att)
	tds = float(tds/att)
	ints = float(ints/att)

	# Step 1: The completion percentage
	step_1 = cmpls - 0.3
	step_1 = step_1 * 5
	step_1 = _min_max(step_1, 0, 2.375)

	# Step 2: The yards per attempt.
	step_2 = yds - 3
	step_2 = step_2 * 0.25
	step_2 = _min_max(step_2, 0, 2.375)

	# Step 3: Touchdown percentage.
	step_3 = tds * 20
	step_3 = _min_max(step_3, 0, 2.375)

	# Step 4: Interception percentage.
	step_4 = ints * 25
	step_4 = 2.375 - step_4
	step_4 = _min_max(step_4, 0, 2.375)

	# Step 5: Compute the rating based on the sum of steps 1-4.
	rating = step_1 + step_2 + step_3 + step_4 + 0.0
	rating = rating / 6
	rating = rating * 100
	# Step 6: Return the rating, formatted to 1 decimal place, as a Decimal.
	return round(rating, 2)

def sort_list(q, key, limit, team):
	ret = []
	for p in q.sort(key).limit(limit).as_aggregate():
		if p.player.team == "UNK":
			continue
		if team != None and p.player.team not in team:
			continue
		result = {}
		for field in p.sql_fields():
			result[field] = getattr(p, field)
		result['team'] = p.player.team
		#result = dict((name, getattr(p, name)) for name in dir(p) if not name.startswith('_'))
		#result['player'] = dict((name, getattr(p.player, name)) for name in dir(p.player) if not name.startswith('_'))

		result['receiving_ypc'] = 0
		if (result['receiving_rec'] != 0):
			result['receiving_ypc'] = round(result['receiving_yds']/result['receiving_rec'], 2)

		result['rushing_ypc'] = 0
		if (result['rushing_att'] != 0):
			result['rushing_ypc'] = round(result['rushing_yds']/result['rushing_att'], 2)

		result['passing_rating'] = 0
		if (result['passing_att'] != 0):
			result['passing_rating'] = handle_nfl_passer_rating(result['passing_att'], result['passing_cmp'], result['passing_yds'], result['passing_tds'], result['passing_int'])
		ret.append(result)
		if debug != None:
			print p.player.full_name
	return ret

def top_players(limit=3, team=None, start_week=1, end_week=18):
	data = {}
	q = nfldb.Query(db)
	teamArr = None
	if team != None:
		teamArr = [team]
		q.game(season_year=2014, season_type='Regular', team=teamArr, week = range(start_week, end_week))
	else:
		q.game(season_year=2014, season_type='Regular',  week = range(start_week, end_week))

	data['passing'] = sort_list(q, 'passing_yds', limit, teamArr)
	data['rushing'] = sort_list(q, 'rushing_yds', limit, teamArr)
	data['receiving'] = sort_list(q, 'receiving_yds', limit, teamArr)
	data['defense_sk'] = sort_list(q, 'defense_sk', limit, teamArr)
	data['defense_int'] = sort_list(q, 'defense_int', limit, teamArr)
	data['defense_tkl'] = sort_list(q, 'defense_tkl', limit, teamArr)
	if debug == None:
		print json.dumps(data)

top_players(count, team)
