from __future__ import with_statement
from fabric.api import *


env.hosts = ['root@pishi.havaliza.ir']
INSTALL_PATH = '~/pishi-server'


def start():
    with cd(INSTALL_PATH):
        run('yarn install')
        run('pm2 start processes.json')


def stop():
    with cd(INSTALL_PATH):
        run('pm2 stop processes.json')


def pull():
    with cd(INSTALL_PATH):
        run('git pull origin master')


def install():
    run('rm -rf %s' % INSTALL_PATH)
    run('git clone git@gitlab.com:havaliza/pishi-server.git %s' % INSTALL_PATH)


def update():
    stop()
    pull()
    start()
