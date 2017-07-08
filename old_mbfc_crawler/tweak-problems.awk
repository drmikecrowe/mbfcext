BEGIN { last = "xxx"}

$0 !~ last && $0 ~ /\// {
    print "# -- Original " $0
    domain = gensub(/([^\/]+).*$/,"\\1", "g", $0)
    printf("s@\"%s\"@\"%s\"@g\n", $0, domain)
}
{
    last = "^"$0;
}
