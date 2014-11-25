#!/usr/bin/python
import nfldb
import nflgame
from nflgame import *
import json
import sys
import urllib
import urllib2
import re

#db = nfldb.connect()

#q.game(season_year=2014, season_type='Regular')
#for pp in q.sort('passing_yds').limit(10).as_aggregate():
#	print pp.player, pp.passing_yds

#q.game(season_year=2014, week=1)
#for p in q.sort('passing_yds').limit(40).as_aggregate():
#	print p.player, p.player.team, p.player_id, p.player.profile_id

def print_players(team):
	q = nfldb.Query(db)
	q.player(team=team)
	for pp in q.as_players():
		print pp.full_name, pp.profile_url

def http_request(url):
	try:
		req = urllib2.Request(url)
		response = urllib2.urlopen(req)
		page = response.read()
		return page
	except:
		return ""

def get_esb_id_profile_url(url):
	try:
		content = http_request(url)
		gid, esb = None, None
		m = re.search('GSIS\s+ID:\s+([0-9-]+)', content)
		n = re.search('ESB\s+ID:\s+([A-Z][A-Z][A-Z][0-9]+)', content)
		if m is not None:
			gid = m.group(1).strip()
		if n is not None:
			esb = n.group(1).strip()
		if len(gid) != 10:
			gid = None
		if len(esb) != 9:
			esb = None
		return esb
	except:
		return ""


def build_roster():
	roster = {}
	img = ''
	for x in nflgame.teams:
		roster[x[0]] = []
		print x[0]
		players_pool = nflgame.players.itervalues()
		for p in players_pool:
			if p.team == x[0]:
				esb=get_esb_id_profile_url(p.profile_url)
				details = p.__dict__
				print details['name']
				details['esb_id'] = esb
				roster[x[0]].append(details)
		ptr = open("./data/"+x[0]+".json", "w+")
		ptr.write(json.dumps(roster[x[0]]))
		ptr.close()
	return roster

def build_mapping():
	img = ''
	for x in nflgame.teams:
		roster = {}
		print x[0]
		players_pool = nflgame.players.itervalues()
		for p in players_pool:
			if p.team == x[0]:
				esb=get_esb_id_profile_url(p.profile_url)
				details = p.__dict__
				details['esb_id'] = esb
				roster[details['gsis_id']] = details
		ptr = open("./data/"+x[0]+".mapping", "w+")
		ptr.write(json.dumps(roster))
		ptr.close()
	return roster
#build_roster()
build_mapping()
#print_players("NYG")
