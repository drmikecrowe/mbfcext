BEGIN { last = "xxx"}

$0 !~ last && $0 ~ /\// {
    print "# -- Original " $0
    domain = gensub(/([^\/]+).*$/,"\\1", "g", $0)
    print domain
}
{
    last = "^"$0;
}
