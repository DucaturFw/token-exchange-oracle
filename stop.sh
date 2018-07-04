if [ -e last.pid ]
then
    pstree -p $(cat last.pid) | grep -o '([0-9]\+)' | grep -o '[0-9]\+' | xargs kill
    rm last.pid
    echo "killed daemon"
fi