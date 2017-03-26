BEGIN { last = "xxx"}

$0 ~ last && $0 ~ /\// {
    print last2
    print $0
}
{
    last2 = $0
    last = "^"$0;
}