./stop.sh
nohup yarn start &> log.txt & echo $! > last.pid